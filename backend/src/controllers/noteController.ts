import { Response, NextFunction } from 'express';
import * as noteService from '../services/noteService';
import * as activityService from '../services/activityService';
import AppError from '../utils/appError';
import { AuthRequest } from '../types';

export async function handleGetNotes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const notes = await noteService.getNotes(req.userId as string, { tag: req.query.tag as string });
    res.status(200).json({ success: true, data: notes });
  } catch (err) {
    next(err);
  }
}

export async function handleGetActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const days = req.query.days ? Number(req.query.days) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const activity = await activityService.getUserActivity(req.userId as string, { days, limit });
    res.status(200).json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
}

export async function handleGetNoteById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const note = await noteService.getNoteById(req.params.id as string, req.userId as string);
    res.status(200).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

export async function handleCreateNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.body || typeof req.body !== 'object') {
      throw new AppError('Request body is required', 400);
    }
    const note = await noteService.createNote(req.userId as string, req.body);
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.body || typeof req.body !== 'object') {
      throw new AppError('Request body is required', 400);
    }
    const note = await noteService.updateNote(req.params.id as string, req.userId as string, req.body);
    res.status(200).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await noteService.deleteNote(req.params.id as string, req.userId as string);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function handleSearchNotes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const queryTerm = (req.query.q as string) || '';
    const notes = await noteService.searchNotes(req.userId as string, queryTerm);
    res.status(200).json({ success: true, data: notes });
  } catch (err) {
    next(err);
  }
}

export async function handleExportNotes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const format = req.query.format === 'markdown' ? 'markdown' : 'json';
    const { contentType, filename, content } = await noteService.exportNotes(req.userId as string, format);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(content);
  } catch (err) {
    next(err);
  }
}

export async function handleImportNotes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.body) {
      throw new AppError('Request body is required', 400);
    }
    const items = Array.isArray(req.body)
      ? req.body
      : (typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>).notes : undefined);
    const result = await noteService.importNotes(req.userId as string, items);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
