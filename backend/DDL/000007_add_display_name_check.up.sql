UPDATE users SET display_name = email WHERE display_name = '';
ALTER TABLE users ADD CONSTRAINT users_display_name_not_empty CHECK (display_name <> '');
