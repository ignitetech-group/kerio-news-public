import { query } from './db';

export async function logAudit(
  userEmail: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entityType: string,
  entityId: string | number,
  details?: string,
) {
  try {
    await query(
      'INSERT INTO audit_log (user_email, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [userEmail, action, entityType, String(entityId), details || '']
    );
  } catch (error) {
    console.error('Audit log failed:', error);
  }
}
