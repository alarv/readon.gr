-- Custom email templates for readon.gr
-- Note: This migration shows the SQL structure, but email templates are typically configured via Supabase Dashboard

-- Update auth site URL and sender name
UPDATE auth.config 
SET 
  site_url = 'https://readon.gr',
  sender_name = 'Readon.gr Team'
WHERE TRUE;

-- Insert custom email templates
-- Confirmation email (Greek)
INSERT INTO auth.email_templates (template_type, subject, body) 
VALUES (
  'confirmation',
  'Επιβεβαίωση Email - Readon.gr',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Επιβεβαίωση Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a73e8;">Readon.gr</h1>
            <p style="color: #666;">Το ελληνικό δημοκρατικό forum</p>
        </div>
        
        <h2>Καλώς ήρθες στο Readon.gr!</h2>
        
        <p>Γεια σου,</p>
        
        <p>Χρειάζεται να επιβεβαιώσεις το email σου για να ολοκληρώσεις την εγγραφή σου στο readon.gr.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" 
               style="background-color: #1a73e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Επιβεβαίωση Email
            </a>
        </div>
        
        <p>Αν δεν μπορείς να κάνεις κλικ στο κουμπί, αντίγραψε και επικόλλησε αυτό το link στον browser σου:</p>
        <p style="word-break: break-all; color: #1a73e8;">{{ .ConfirmationURL }}</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="font-size: 12px; color: #666;">
            Αυτό το email στάλθηκε από το readon.gr. Αν δεν δημιούργησες λογαριασμό, απλώς αγνόησε αυτό το μήνυμα.
        </p>
    </div>
</body>
</html>'
) ON CONFLICT (template_type) DO UPDATE SET subject = EXCLUDED.subject, body = EXCLUDED.body;

-- Password reset email (Greek)
INSERT INTO auth.email_templates (template_type, subject, body) 
VALUES (
  'recovery',
  'Επαναφορά Κωδικού - Readon.gr',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Επαναφορά Κωδικού</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a73e8;">Readon.gr</h1>
            <p style="color: #666;">Το ελληνικό δημοκρατικό forum</p>
        </div>
        
        <h2>Επαναφορά Κωδικού</h2>
        
        <p>Γεια σου,</p>
        
        <p>Λάβαμε αίτηση για επαναφορά του κωδικού σου στο readon.gr.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" 
               style="background-color: #1a73e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Επαναφορά Κωδικού
            </a>
        </div>
        
        <p>Αν δεν μπορείς να κάνεις κλικ στο κουμπί, αντίγραψε και επικόλλησε αυτό το link στον browser σου:</p>
        <p style="word-break: break-all; color: #1a73e8;">{{ .ConfirmationURL }}</p>
        
        <p><strong>Αν δεν ζήτησες αυτή την επαναφορά, απλώς αγνόησε αυτό το email.</strong></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="font-size: 12px; color: #666;">
            Αυτό το email στάλθηκε από το readon.gr για λόγους ασφαλείας.
        </p>
    </div>
</body>
</html>'
) ON CONFLICT (template_type) DO UPDATE SET subject = EXCLUDED.subject, body = EXCLUDED.body;