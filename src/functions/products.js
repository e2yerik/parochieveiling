
exports.handler = async function () {

    return {
        statusCode: 200,
        body: JSON.stringify([
            {code: '123'},
            {code: '456'},
            {code: '789'}
        ])
    };
}