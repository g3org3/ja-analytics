export async function post () {
  console.log('/api')
  return new Response('created', {
    status: 201,
    statusText: 'created',
  })
}
