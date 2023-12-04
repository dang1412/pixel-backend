#!/bin/sh

suri=$(cat ./mnemonic)
url="wss://ws.test.azero.dev"

build_deploy() {
    local contract=$1
    local contract_addr=$2

    # build
    cargo contract build --manifest-path ./$contract/Cargo.toml

    # upload
    cargo contract upload --manifest-path ./$contract/Cargo.toml -s "$suri" --url $url -x

    # contract hash
    hash=$(head ./$contract/target/ink/$contract.json | grep hash | awk -F'"' '/"hash":/ {print $4}')

    # extrinsic call to set contract code hash
    echo $contract_addr
    cargo contract call --manifest-path ./$contract/Cargo.toml --url $url --contract $contract_addr -s "$suri" -m "set_code" --args $hash -x
}

# build_deploy "pixel" "5C7hxSxrrtrcS1FNmE21Xm7QVbHgWYULgp6nssCPwVepo2sE"
# build_deploy "pixel_lottery" "5HTYLW5BG972bbqjViYouBRww1ii2wLR8CJzKskqaKuMbLxD"
build_deploy "pixel_adventure" "5EsWS2z7PEtThvUVMGxANoVuDherQat62fxG7dyR2e7p5Nyd"
