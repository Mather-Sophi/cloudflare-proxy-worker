import { env } from 'cloudflare:workers'
import type { SurfaceDecisionResponse } from '../types'
import { ContentElementHandler } from './ContentElementHandler'

export default function handleSurfaceComponents(response: Response, surfaceDecisions: SurfaceDecisionResponse): Response {
    if (surfaceDecisions.componentsSkipped) {
        return response
    }

    let doRewrite = false
    const htmlRewriter = new HTMLRewriter()
    Object.values(surfaceDecisions.componentBehaviors).forEach((componentBehavior) => {
        if (!componentBehavior.metadata.cssSelector || !componentBehavior.content) {
            return
        }

        doRewrite = true
        htmlRewriter.on(componentBehavior.metadata.cssSelector, new ContentElementHandler(componentBehavior.content))
    })

    if (env.INJECT_SCRIPT_URL) {
        htmlRewriter.on('head', {
            element(element) {
                element.append(`<script src="${env.INJECT_SCRIPT_URL}" async defer></script>`, { html: true })
            },
        })
    }

    return doRewrite ? htmlRewriter.transform(response) : response
}
