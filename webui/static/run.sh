mv estonia_2023.json estonia_2023.json.bak
mv germany_2021.json germany_2021.json.bak
mv square.json       square.json.bak
mv sweden_2022.json  sweden_2022.json.bak

rg ',"opacity":\d*}' estonia_2023.json.bak -r '}' > estonia_2023.json
rg ',"opacity":\d*}' germany_2021.json.bak -r '}' > germany_2021.json
rg ',"opacity":\d*}' square.json.bak -r '}' > square.json
rg ',"opacity":\d*}' sweden_2022.json.bak -r '}' > sweden_2022.json

