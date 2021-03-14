
// necessário para usarmos a data conforme vemos no Brasil
const intl = require('intl')

const { age, date } = require('../../lib/utils')

const Instructor = require('./models/instructor')


// método conhecido como shorthand
// 
module.exports = {

    index( req, res ){

        let { filter, page, limit } = req.query

        // page é igual a page, se não existir coloque 1
        page = page || 1
        limit = limit || 2 // limit aqui pulando de 2 em 2

        // estrutura matemática para pular de 2 em 2
        let offset = limit * (page - 1)

        const params = {
            filter,
            page,
            limit,
            offset,
            
            // função já dentro que irá substituir o funcition(){} 
            callback(instructors){

                const pagination = {
                          // Math.ceil, fazendo calculo arredondando sempre para cima
                    total: Math.ceil(instructors[0].total / limit),
                    page
                }

                return res.render('instructors/index', { instructors, pagination, filter } )
            }
        }

        Instructor.paginate(params)

        /*
        if (filter){

            Instructor.findBy(filter, function(instructors) {
                return res.render('instructors/index', { instructors, filter } )
            })

        } else {
            
            // dentro do all pode colocar function, pq no all do outro tem o callback
            // dentro do function pode colocar instructors, pq no outro tem o results.rows
            Instructor.all(function(instructors){
                return res.render('instructors/index', { instructors } )
            })

        }
        */

    },


    create( req, res ){
        return res.render('instructors/create')
    },

    post( req, res ){
        // fazendo array com as chaves do form (inputs) 
        const keys = Object.keys(req.body)
        
        // estrutura de repetição nos inputs para verificar se algum está vazio
        // validando o form
        for( key of keys ){
            if ( req.body[key] == "" ){
                return res.send(' Please, fill all fields!')
            }
        }


        Instructor.create(req.body, function(instructor){
            return res.redirect(`/instructors/${instructor.id}`)
        })
         
    },

    show( req, res ){
        Instructor.find(req.params.id, function(instructor) {
            if (!instructor) return res.send('Instructor not found!')
            
            instructor.age = age(instructor.birth)
            instructor.services = instructor.services.split(",")

            instructor.created_at = date(instructor.created_at).format


            return res.render('instructors/show', { instructor })
        })
    },

    edit( req, res ){
        Instructor.find(req.params.id, function(instructor) {
            if (!instructor) return res.send('Instructor not found!')
            
            instructor.birth = date(instructor.birth).iso
            

            return res.render('instructors/edit', { instructor })
        })
        
    },


    put( req, res ){
        // fazendo array com as chaves do form (inputs) 
        const keys = Object.keys(req.body)
        
        // estrutura de repetição nos inputs para verificar se algum está vazio
        // validando o form
        for( key of keys ){
            if ( req.body[key] == "" ){
                return res.send(' Please, fill all fields!')
            }
        }

        Instructor.update(req.body, function(){
           return res.redirect(`/instructors/${req.body.id}`)
       })
    },

    delete( req, res ){ 
                          // manda só o id  
        Instructor.delete(req.body.id, function(){
            return res.redirect(`/instructors`)
        })
    },
}


