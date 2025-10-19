from django.apps import AppConfig
from django.conf import settings
from django.db.models.signals import post_migrate
import os


class EstoqueConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'estoque'

    def ready(self):
        # Ensure media/produtos directory exists after migrations
        def _ensure_media_dirs(sender, **kwargs):
            try:
                media_root = getattr(settings, 'MEDIA_ROOT', None)
                if media_root:
                    produtos_dir = os.path.join(media_root, 'produtos')
                    os.makedirs(produtos_dir, exist_ok=True)
            except Exception:
                # Swallow any filesystem errors silently in dev
                pass

        post_migrate.connect(_ensure_media_dirs, sender=self)
