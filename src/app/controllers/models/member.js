const db = require('../../../config/db')

// trazendo age e date do utils
const { age, date } = require('../../../lib/utils')


module.exports = {
    // a função callback dentro da função all, será chamada logo depois de executar o db.query ...
    all(callback) {
        db.query(`
            SELECT * 
            FROM members
            ORDER BY name ASC`, function(err, results){
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
            INSERT INTO members (
                name,
                avatar_url,
                gender,
                email,
                birth,
                blood,
                weight,
                height,
                instructor_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `
        
        // esse ARRAy é que vai ser usado para substituir os de cima ($1 etc)
        const values = [
            data.name,
            data.avatar_url,
            data.gender,
            data.email,
            date(data.birth).iso,
            data.blood,
            data.weight,
            data.height,
            data.intructor
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
            SELECT members. *, instructors.name AS instructor_name
            FROM members 
            LEFT JOIN instructors ON (members.instructor_id = instructors.id)
            WHERE members.id = $1`, [id], function(err, results){
                // o throw vai parar a aplicação se houver algum erro
                if(err) throw `Database Error! ${err}`

                // pegar só o primeiro registro [0]
                callback(results.rows[0])

            } )
    },
    
    update(data, callback){
        // UPDATE, atualize a tabela members, e coloque os dados ...
        // WHERE id = $6, sempre dizer qual a condição desse update, senão atualizará todos os dados 
        const query = `
            UPDATE members SET
            avatar_url=($1),
            name=($2),
            birth=($3),
            gender=($4),
            email=($5),
            blood=($6),
            weight=($7),
            height=($8),
            instructor_id=($9)
            WHERE id = $10
        `

        const values = [
            data.avatar_url,
            data.name,
            date(data.birth).iso,
            data.gender,
            data.email,
            data.blood,
            data.weight,
            data.height,
            data.instructor,
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
        db.query(`DELETE FROM members WHERE id = $1`, [id], function(err, results){
            if(err) throw `Database Error! ${err}`

            return callback()
        })
    },

    instructorsSelectOptions(callback){
        db.query(`
            SELECT name, id FROM instructors`, function(err, results){
            
                if(err) throw `Database Error! ${err}`

            callback(results.rows)
        })
    },

    paginate(params){

        const { filter, limit, offset, callback } = params
        
        let query = '',
            filterQuery = '',
            totalQuery = `(
                SELECT count(*) FROM members
            ) AS total` 

        if ( filter ) {

            // trás o que já tinha nela
            filterQuery = `
            WHERE members.name ILIKE '%${filter}%'
            OR members.email ILIKE '%${filter}%'
            ` 

            totalQuery = `(
                SELECT count(*) FROM members
                ${filterQuery}
            ) AS total`
        }

        query = `
        SELECT members.*, ${totalQuery}
        FROM members
        ${filterQuery}
        LIMIT $1 OFFSET $2
        `

        db.query(query, [ limit, offset ], function(err, results){
            if (err) throw `Database Error!`

            callback(results.rows)
        })
    }
}