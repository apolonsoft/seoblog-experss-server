const uniqueMessage = error => {
    let output;
    try {
        let fieldName = error.errmsg.substring(error.message.lastIndexOf(':') + 2, error.errmsg.lastIndexOf('_1'));
        output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';
    } catch (ex) {
        output = 'Unique field already exists';
    }
    return output;
}

exports.errorHandler = error => {

    let message = '';
    if (error.code) {
        switch (error.code) {
            case 11000:
                message = uniqueMessage(error);
            case 11001:
                message = uniqueMessage(error);
                break;
            default:
                message = 'Something went wrong';
        }
    } else {
        for (let errorName in error.errors) {
            if (error.errors[errorName].message) errmsg = error.errors[errorName].errmsg
        }
    }
}
