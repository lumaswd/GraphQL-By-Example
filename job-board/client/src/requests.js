import { isLoggedIn, getAccessToken } from "./auth";
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from 'apollo-boost';
import gql from 'graphql-tag';


const endpointURL = 'http://localhost:9000/graphql';


const authLink = new ApolloLink((operation, forward) => {
    if (isLoggedIn()) {
        operation.setContext({
            headers: {
                'authorization': 'Bearer ' + getAccessToken()
            }
        });
    }
    return forward(operation);
});


const client = new ApolloClient({
    link: ApolloLink.from([
        authLink, // for authorization
        new HttpLink({ uri: endpointURL })
    ]),
    cache: new InMemoryCache()
});


const jobDetailFragment = gql`
    fragment JobDetail on Job {
        id
        title
        company {
            id
            name
        }
        description
    }
`;


// gql ==> Template function 
// jobDetailFragment belongs to/defines ...jobDetail
// ...jobDetail ==> Fragment name
const jobQuery = gql`
    query JobQuery($id: ID!) { 
        job(id: $id) {
            ...JobDetail 
        }
    }
    ${jobDetailFragment} 
`;


const jobsQuery = gql` 
    query JobsQuery {
        jobs {
            id
            title
            company {
                id
                name
            }
        }
    }
`;


const companyQuery = gql`
    query CompanyQuery($id: ID!) {
        company(id: $id) {
            id
            name
            description
            jobs {
                id
                title
            }
        }
    }
`;


const createJobMutation = gql`
    mutation CreateJob($createJobInput: CreateJobInput) {
        job: createJob(createJobInput: $createJobInput) {
            ...JobDetail
        }
    }
    ${jobDetailFragment}
`;


/*
export async function graphqlRequest(query, variables = {}) {
    const request = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query, variables }) // Shorthand Syntax
    };
    if (isLoggedIn()) {
        request.headers['authorization'] = 'Bearer ' + getAccessToken();
    }
    const response = await fetch(endpointURL, request);
    const responseBody = await response.json();
    if (responseBody.errors) {  // Idea of GraphQL specific error management
        const message = responseBody.errors.map(e => e.message).join('\n');
        throw new Error(message);
    }
    return responseBody.data;
}
*/


/*
export async function loadJobs() {
    const query = `
    {
        jobs {
          id
          title
          company {
            id
            name
          }
        }
    }
    `;
    const { jobs } = await graphqlRequest(query);
    return jobs;
}
*/


// Apollo variant
export async function loadJobs() {
    const { data: { jobs } } = await client.query({ query: jobsQuery, fetchPolicy: 'no-cache' }); // nested object destructuring // fetchPolicy ==> define caching options
    return jobs;
}


/*
export async function loadJob(id) {
    const query = `
    query JobQuery($id: ID!) {  
        job(id: $id) {
          id
          title
          company {
            id
            name
          }
          description
        }
    }
    `;
    const { job } = await graphqlRequest(query, { id });
    return job;
}
*/


// Apollo variant
export async function loadJob(id) {
    const { data: { job } } = await client.query({ query: jobQuery, variables: { id } });
    return job;
}


/*
export async function loadCompany(id) {
    const query = `
    query CompanyQuery($id: ID!) {
        company(id: $id) {
            id
            name
            description
            jobs {
                id
                title
            }
        }
    }
    `;
    const { company } = await graphqlRequest(query, { id });
    return company;
}
*/


// Apollo variant
export async function loadCompany(id) {
    const { data: { company } } = await client.query({ query: companyQuery, variables: { id } })
    return company;
}


/*
export async function createJob(createJobInput) {
    const mutation = `
    mutation CreateJob($createJobInput: CreateJobInput) {
        job: createJob(createJobInput: $createJobInput) {
          id
          title
          company {
            id
            name
          }
        }
      }
    `;
    const { job } = await graphqlRequest(mutation, { createJobInput });
    return job;
}
*/


// Apollo variant
export async function createJob(createJobInput) {
    const { data: { job } } = await client.mutate({
        mutation: createJobMutation,
        variables: { createJobInput },
        update: (cache, { data }) => { // gives us full control over the cache // cach ==> a.k.a store, proxy // 2nd parameter ==> mutation result; destructuring!
            // save the newly created job into the cache
            cache.writeQuery({  // save the result of a query
                query: jobQuery,
                variables: { id: data.job.id },
                data
            })
        }
    });
    return job;
}
