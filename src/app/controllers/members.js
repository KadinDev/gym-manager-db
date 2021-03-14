
// necessário para usarmos a data conforme vemos no Brasil
const intl = require('intl')

// trazendo age e date do utils
const { age, date } = require('../../lib/utils')

const Member = require('./models/member')


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
            callback(members){

                const pagination = {
                          // Math.ceil, fazendo calculo arredondando sempre para cima
                    total: Math.ceil(members[0].total / limit),
                    page
                }

                return res.render('members/index', { members, pagination, filter } )
            }
        }

        Member.paginate(params)
    },

    /*
    index( req, res ){
        // dentro do all pode colocar function, pq no all do outro tem o callback
        // dentro do function pode colocar members, pq no outro tem o results.rows
        Member.all(function(members){
            return res.render('members/index', { members } )
        })        
    },
    */

    create( req, res ){

        Member.instructorsSelectOptions(function(options) {
            return res.render('members/create', { instructorOptions: options } )   
        })

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


        Member.create(req.body, function(member){
            return res.redirect(`/members/${member.id}`)
        })
         
    },

    show( req, res ){
        Member.find(req.params.id, function(member) {
            if (!member) return res.send('member not found!')
            
            member.birth = date(member.birth).birthDay

            return res.render('members/show', { member })
        })
    },

    edit( req, res ){
        Member.find(req.params.id, function(member) {
            if (!member) return res.send('member not found!')
            
            member.birth = date(member.birth).iso
            
            Member.instructorsSelectOptions(function(options) {
                return res.render('members/edit', { member, instructorOptions: options } )   
            })
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

        Member.update(req.body, function(){
           return res.redirect(`/members/${req.body.id}`)
       })
    },

    delete( req, res ){ 
                          // manda só o id  
        Member.delete(req.body.id, function(){
            return res.redirect(`/members`)
        })
    },
}


