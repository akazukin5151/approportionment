import os

os.chdir('rust/stv')
os.system('patch -u lib.rs -i restore.patch')

for n in [1, 2, 3, 4]:
    if os.getenv('p' + str(n)) == 'true':
        os.system(f'patch -u lib.rs -i {n}.patch -f')

