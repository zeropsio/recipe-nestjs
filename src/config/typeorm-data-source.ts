import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { getDbConfig } from './db.config';
import { ConfigService } from '@nestjs/config';

dotenv.config();

const configService = new ConfigService();

const dataSource = new DataSource(getDbConfig(configService) as any);

export default dataSource;
