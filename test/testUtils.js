const rejectionOf = promise =>
    promise.then(
        value => {
            throw value
        },
        reason => {
            return reason
        },
    )

module.exports = {
    rejectionOf,
}
