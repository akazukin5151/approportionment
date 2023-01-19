for f in $(rg 'export function (.*?)[<\(]' -r '$1' -o -N -I); do
    s=$(rg "$f" -t ts --count-matches -I | awk '{if($0!=0) s+=$1}END{print s}')
    if [[ "$s" -eq 2 ]]; then
        rg "$f"
    fi
done
