const db = require('./db');


const Query = { // Root Object // query ==> read data
    jobs: () => db.jobs.list(),
    // job: (root, args) => db.jobs.get(args.id) // first argument (root) ==> parent value (this case => root object) // second argument (args) ==> arguments passed into the query
    job: (root, { id }) => db.jobs.get(id), // simplified version ==> object destructuring
    company: (root, { id }) => db.companies.get(id)
};

// Best Practice
// Use GraphQL aliases
// Use single input argument for mutations
// mutation {
// job: createJob() ...   
// }
const Mutation = { // Object for the Mutation Type // mutations ==> modify data // context ==> provided by application
    createJob: (root, { createJobInput }, { user }) => { // { user } ==> destructuring of context // main point ==> use context to provide whatever application specific objects to the code // implementation could vary for other authentication methods 
        if (!user) {
            throw new Error('Unauthorized');
        }
        const id = db.jobs.create({ companyId: user.companyId, ...createJobInput });
        return db.jobs.get(id);
    }
};


const Job = {
    company: (job) => db.companies.get(job.companyId)
};


const Company = { // Root type Company
    jobs: (company) => db.jobs.list().filter(job => job.companyId === company.id) // first argument (company) ==> parent object
};


module.exports = { Query, Mutation, Job, Company };