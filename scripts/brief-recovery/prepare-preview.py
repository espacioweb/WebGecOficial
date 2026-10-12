"""Stage the build using tracked public assets, preserving local source media."""
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path.cwd()
tracked = set(subprocess.check_output(['git', 'ls-files', 'public'], text=True).splitlines())
staging = Path(tempfile.mkdtemp(prefix='gec-brief-preview-', dir='/private/tmp'))


def ignore(directory, names):
    relative = Path(directory).relative_to(root / 'dist')
    return [name for name in names if (root / 'public' / relative / name).is_file()
            and str(Path('public') / relative / name) not in tracked]


shutil.copytree(root / 'dist', staging / 'dist', ignore=ignore)
(root / '.brief-preview-path.local').write_text(str(staging / 'dist'))
print(staging / 'dist')
