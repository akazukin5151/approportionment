import os

s = ''
for n in [1, 2, 3, 4]:
    if os.getenv('p' + str(n)) == 'true':
        s += '1'
    else:
        s += '0'
print(s)
