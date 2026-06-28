import {
  Controller, Post, UploadedFile, UseInterceptors,
  Body, BadRequestException, Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiSummaryService } from './ai-summary.service';
import { Public } from '../../common/auth/public.decorator';

@ApiTags('AI Summary')
@Controller('ai')
export class AiSummaryController {
  private readonly logger = new Logger(AiSummaryController.name);

  constructor(private readonly aiService: AiSummaryService) {}

  @Post('summarize')
  @Public()
  @ApiOperation({ summary: 'Upload a medical document and get an AI-generated summary' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_, file, cb) => {
      const allowed = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new BadRequestException('Only PDF, TXT, JPEG and PNG files are supported'), false);
    },
  }))
  async summarize(
    @UploadedFile() file: Express.Multer.File,
    @Body('language') language?: string,
  ) {
    this.logger.log(`AI summary requested — file: ${file?.originalname ?? 'none'}, lang: ${language ?? 'en'}`);

    // Extract text from file (for PDF: read as text; for demo: use filename + mock)
    let text = '';
    if (file) {
      if (file.mimetype === 'text/plain') {
        text = file.buffer.toString('utf-8');
      } else {
        // For PDF/images in demo: the service will return structured demo data
        text = `[Document: ${file.originalname}] [Size: ${file.size} bytes] [Type: ${file.mimetype}]`;
      }
    }

    const summary = await this.aiService.summarize(
      text || 'Demo medical document',
      language || 'en',
      file?.originalname || 'uploaded_document.pdf',
    );

    return {
      success: true,
      summary,
      meta: {
        filename: file?.originalname,
        size: file?.size,
        mimetype: file?.mimetype,
        processedAt: new Date().toISOString(),
      },
    };
  }
}
