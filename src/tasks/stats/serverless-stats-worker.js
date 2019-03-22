const AWS = require('aws-sdk')
const s3 = new AWS.s3({ apiVersion: '2006-03-01' })

const getProbot = require('../../utils/getProbot')

async function getInstallations(app) {
    const github = await app.auth()

    return github.paginate(
        github.apps.listInstallations.endpoint.merge({
            per_page: 100,
            headers: {
                accept: 'application/vnd.github.machine-man-preview+json',
            },
        }),
        response => {
            return response.data
        },
    )
}

const accountsCache = {}

async function popularInstallations({ app, installations }) {
    let popular = await Promise.all(
        installations.map(async installation => {
            if (accountsCache[installation.id]) {
                return accountsCache[installation.id]
            }

            const { account } = installation

            const github = await app.auth(installation.id)

            const repositories = await github.paginate(
                github.apps.listRepos.endpoint.merge({
                    per_page: 100,
                    headers: {
                        accept:
                            'application/vnd.github.machine-man-preview+json',
                    },
                }),
                response => {
                    return response.data.repositories.filter(
                        repository => !repository.private,
                    )
                },
            )

            account.stars = repositories.reduce((stars, repository) => {
                return stars + repository.stargazers_count
            }, 0)

            accountsCache[installation.id] = account

            return account
        }),
    )

    popular = popular.filter(installation => installation.stars > 0)
    return popular.sort((a, b) => b.stars - a.stars).slice(0, 10)
}

let installationCache

async function getStats(probot) {
    const app = probot.apps[0]

    if (!app) {
        throw new Error(
            'Stats needs an app, we usually depend on sentry being loaded. You can load sentry by setting the SENTRY_DSN env variable)',
        )
    }

    if (!installationCache) {
        const installationsNew = await getInstallations(app)
        installationCache = installationsNew
    }

    const popular = await popularInstallations({
        app,
        installations: installationCache,
    })
    return {
        installations: installationCache.length,
        popular,
    }
}

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false

    try {
        const probot = getProbot()
        const stats = await getStats(probot)
        console.log(stats) // eslint-disable-line no-console

        await s3
            .putObject({
                Bucket: process.env.STATS_BUCKET,
                Key: 'stats.json',
                Body: JSON.stringify(stats),
            })
            .promise()

        return {
            statusCode: 200,
            body: JSON.stringify(stats),
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error.message),
        }
    }
}
