for file in $(fd .json); do
    mv $file "$file.bak"
    rg ',"opacity":\d*}' "$file.bak" -r '}' > $file
done
