import { Request, Response } from 'express';
import { BaseController } from '@/core/base/BaseController';
import { LocalizedText } from '@/entities/LocalizedText';

export class LocalizedTextsController extends BaseController<LocalizedText> {
  constructor() {
    super(LocalizedText);
  }
}
