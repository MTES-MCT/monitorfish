for FILEPATH in $(find pot -name '*.pot'); do
    echo Updating $FILEPATH

    # examples/dir/to/source-file.pot => examples_dir_to_source-file
    RESOURCE_SLUG=$(echo $FILEPATH | sed 's/.pot$//' | tr '/' '_')

    # examples/locale/en.po => locale/<lang>/LC_MESSAGES/examples/locale/en.po
    FILE_FILTER='locale/<lang>/LC_MESSAGES/'$(echo $FILEPATH | sed 's/.pot$/.po/' | sed 's/^pot\///')

    poetry run tx add \
        --organization ministere-de-la-transition-ecologique-et-solidaire-1 \
        --project monitorfish \
        --resource $RESOURCE_SLUG \
        --file-filter "$FILE_FILTER" \
        --type PO \
        $FILEPATH
done
