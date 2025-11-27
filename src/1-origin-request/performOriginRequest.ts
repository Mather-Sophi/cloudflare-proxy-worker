import getTargetUrl from './getTargetUrl'

export default function performOriginRequest(request: Request, env: Env): Promise<Response> {
    const targetUrl = getTargetUrl(request.url, env.ORIGIN_URL)
    return fetch(targetUrl, request)
}
