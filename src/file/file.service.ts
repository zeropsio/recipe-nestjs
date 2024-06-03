import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private s3Client: S3Client;

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('STORAGE_REGION'),
      endpoint: this.configService.get<string>('STORAGE_ENDPOINT'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get<string>('STORAGE_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'STORAGE_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<File> {
    const fileId = uuidv4();
    const s3Params = {
      Bucket: this.configService.get<string>('STORAGE_S3_BUCKET_NAME'),
      Key: fileId,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: s3Params,
      });
      const s3Result = await upload.done();
      const savedFile = await this.saveFileMetadata(file, s3Result.Location);
      await this.sendSuccessEmail(savedFile);
      return savedFile;
    } catch (error) {
      this.logger.error(
        `Error uploading file to S3: ${file.originalname}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async listFiles(): Promise<File[]> {
    try {
      const files = await this.fileRepository.find();
      return files;
    } catch (error) {
      this.logger.error('Error listing files', error.stack);
      throw new InternalServerErrorException('Failed to list files');
    }
  }

  private async saveFileMetadata(
    file: Express.Multer.File,
    path: string,
  ): Promise<File> {
    try {
      const newFile = this.fileRepository.create({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        path,
        createdAt: new Date(),
      });
      await this.fileRepository.save(newFile);
      this.logger.log(`File metadata saved: ${file.originalname}`);
      return newFile;
    } catch (error) {
      this.logger.error(
        `Error saving file metadata: ${file.originalname}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to save file metadata');
    }
  }

  private async sendSuccessEmail(file: File): Promise<void> {
    const emailContent = `
      <p>File <strong>${file.name}</strong> has been successfully uploaded.</p>
    `;

    try {
      await this.mailerService.sendMail({
        to: 'recipient@example.com',
        subject: 'File Upload Successful',
        html: emailContent,
      });
      this.logger.log(`Success email sent for file: ${file.name}`);
    } catch (error) {
      this.logger.error('Error sending success email', error.stack);
    }
  }
}
