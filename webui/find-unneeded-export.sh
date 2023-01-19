for f in $(rg 'export function (.*?)[<\(]' -r '$1' -o -N -I); do
    s=$(rg "$f" -t ts --count-matches -I | awk '{if($0!=0) s+=$1}END{print s}')
    if [[ "$s" -eq 1 ]]; then
        rg "$f"
    fi
done

for f in $(rg 'export let (.*?)[=:]' -r '$1' -o -N -I -t ts); do
    s=$(rg "$f" -t ts --count-matches -I | awk '{if($0!=0) s+=$1}END{print s}')
    if [[ "$s" -eq 1 ]]; then
        rg "$f"
    fi
done

for f in $(rg 'export const (.*?)[=:]' -r '$1' -o -N -I -t ts); do
    s=$(rg "$f" -t ts --count-matches -I | awk '{if($0!=0) s+=$1}END{print s}')
    if [[ "$s" -eq 1 ]]; then
        rg "$f"
    fi
done
