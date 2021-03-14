const db = require('../../../config/db')

// trazendo age e date do utils
const { age, date } = require('../../../lib/utils')


module.exports = {
    // a função callback dentro da função all, será chamada logo depois de executar o db.query ...
    all(callback) {
        db.query(`
            SELECT instructors. *, count(members) AS total_students
            FROM instructors
            LEFT JOIN members ON (members.instructor_id = instructors.id)
            GROUP BY instructors.id
            ORDER BY total_students DESC`, function(err, results){
            // o throw vai parar a aplicação se houver algum erro
            if(err) throw `Database Error! ${err}`
    
            callback(results.rows)
        })
    },

    // dentro do create o req.body está sendo chamado de data
    create(data, callback ) {
        // Conectando ao banco de dados
        // instrução SQL
        // Assim que rodar e cadastrar no banco, pega o ID e me devolve - RETURNING id
        const query = `
            INSERT INTO instructors (
                name,
                avatar_url,
                gender,
                services,
                birth,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `
        
        // esse ARRAy é que vai ser usado para substituir os de cima ($1 etc)
        const values = [
            data.name,
            data.avatar_url,
            data.gender,
            data.services,
            date(data.birth).iso,
            date(Date.now()).iso
        ]

                                // callback function, retorna os resultados do banco de dados
        db.query(query, values, function(err, results){
            // o throw vai parar a aplicação se houver algum erro
            if(err) throw `Database Error! ${err}`

            // como é um registro só no caso do post, coloca o [0] depois do rows
            callback(results.rows[0])           
        })
    },


    find(id, callback) {
        // WHERE = ONDE
        db.query(`
            SELECT * 
            FROM instructors 
            WHERE id = $1`, [id], function(err, results){
                // o throw vai parar a aplicação se houver algum erro
                if(err) throw `Database Error! ${err}`

                // pegar só o primeiro registro [0]
                callback(results.rows[0])

            } )
    },

    findBy(filter, callback){

        db.query(`
            SELECT instructors. *, count(members) AS total_students
            FROM instructors
            LEFT JOIN members ON (members.instructor_id = instructors.id)
            WHERE instructors.name ILIKE '%${filter}%'
            OR instructors.services ILIKE '%${filter}%'
            GROUP BY instructors.id
            ORDER BY total_students DESC`, function(err, results){
            // o throw vai parar a aplicação se houver algum erro
            if(err) throw `Database Error! ${err}`
    
            callback(results.rows)
        })

    },
    
    update(data, callback){
        // UPDATE, atualize a tabela instructors, e coloque os dados ...
        // WHERE id = $6, sempre dizer qual a condição desse update, senão atualizará todos os dados 
        const query = `
            UPDATE instructors SET
            avatar_url=($1),
            name=($2),
            birth=($3),
            gender=($4),
            services=($5)
            WHERE id = $6
        `

        const values = [
            data.avatar_url,
            data.name,
            date(data.birth).iso,
            data.gender,
            data.services,
            data.id
        ]

        db.query(query, values, function(err, results){
            // o throw vai parar a aplicação se houver algum erro
            if(err) throw `Database Error! ${err}`

            callback()
        })
    },

    delete(id, callback) {
        // where id for igual o id
        db.query(`DELETE FROM instructors WHERE id = $1`, [id], function(err, results){
            if(err) throw `Database Error! ${err}`

            return callback()
        })
    },

    paginate(params){

        const { filter, limit, offset, callback } = params
        
        let query = '',
            filterQuery = '',
            totalQuery = `(
                SELECT count(*) FROM instructors
            ) AS total` 

        if ( filter ) {

            // trás o que já tinha nela
            filterQuery = `
            WHERE instructors.name ILIKE '%${filter}%'
            OR instructors.services ILIKE '%${filter}%'
            ` 

            totalQuery = `(
                SELECT count(*) FROM instructors
                ${filterQuery}
            ) AS total`
        }

        query = `
        SELECT instructors.*, ${totalQuery} , count(members) AS total_students
        FROM instructors
        LEFT JOIN members ON (instructors.id = members.instructor_id)
        ${filterQuery}
        GROUP BY instructors.id LIMIT $1 OFFSET $2
        `

        db.query(query, [ limit, offset ], function(err, results){
            if (err) throw `Database Error!`

            callback(results.rows)
        })
    }
}