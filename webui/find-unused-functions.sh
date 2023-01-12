for f in $(rg 'function (.*?)[<\(]' -r '$1' -o -N -I); do
    s=$(rg "$f" -t ts --count-matches -I | awk '{s+=$1}END{print s}')
    if [[ "$s" -eq 1 ]]; then
        echo "$f"
    fi
done
