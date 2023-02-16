const { Client } = require('@elastic/elasticsearch')
const client = new Client({
    cloud: {
        id: 'e91d8539cd12452a83151f476b50447c:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQwMWIxMWJlOTk1ZGQ0Zjg0OTExYTgxY2Q2ZGNjMTliYSRmZGYzMjlkNGZkZTA0YTFkOGZjOGY5YmM1MDVhMTdkMA=='
    },
    auth: {
        username: 'elastic',
        password: 'vOa7Ej29TYGO9nVHHkgagtgA'
    }
})

async function run() {

    // await client.index({
    //     index: 'ai_risang',
    //     document: {
    //         kunci: 'nama',
    //         jawab: 'Risang Pinto Nugroho'
    //     }
    // })

    // await client.index({
    //     index: 'ai_risang',
    //     document: {
    //         kunci: 'nama panggilan',
    //         jawab: 'Risang'
    //     }
    // })

    // await client.index({
    //     index: 'ai_risang',
    //     document: {
    //         kunci: 'nama ibu',
    //         jawab: 'Rudi Purwati'
    //     }
    // })

    const result = await client.search({
        index: 'ai_risang',
        query: {
            match_bool_prefix: {
                kunci: 'Ibu kamu namanya siapa?'
            }
        }
    })

    return result.hits.hits;
}

run().then((re) => {
    console.log('selesai', re);
})
