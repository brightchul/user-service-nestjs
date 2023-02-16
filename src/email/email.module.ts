import { Module } from '@nestjs/common';

import { EmailService, nodemailerProvider } from './email.service';

@Module({
  providers: [EmailService, nodemailerProvider],
  exports: [EmailService],
})
export class EmailModule {}
