// Stuurt bezoekers van www.casaserenacalpe.com en casa-serena-6qv.pages.dev door naar casaserenacalpe.com
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === 'www.casaserenacalpe.com' || url.hostname === 'casa-serena-6qv.pages.dev') {
    url.hostname = 'casaserenacalpe.com';
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
