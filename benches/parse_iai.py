def parse_data() -> dict[str, dict[str, str]]:
    with open('target/iai.txt', 'r') as f:
        lines = f.readlines()

    data: dict[str, dict[str, str]] = {}
    for line in lines:
        # ignore empty lines
        if line == '\n':
            continue

        if line.startswith(' '):
            splitted = line.split(':')
            ty = splitted[0].strip()
            num = splitted[1].strip().removesuffix('\n')
            # by python 3.7, dictionaries maintain insertion order
            k, v = data.popitem()
            v[ty] = num
            data[k] = v
        else:
            # turn the underscore into dash to distinguish it from underscores
            # that separate other paramenter infos
            name = line.removesuffix('\n').replace('sainte_lague', 'sainte-lague')
            data[name] = {}

    return data
