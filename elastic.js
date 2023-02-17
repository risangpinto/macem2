const { Client } = require('@elastic/elasticsearch');
const { elastic } = require('./config');

const client = new Client(elastic);

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
