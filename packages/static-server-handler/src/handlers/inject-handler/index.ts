import es from 'event-stream';
import type { ServerResponse } from 'http';
import type { SendStream } from 'send';
import { cast, getInjectedCode } from '../../utils';
import type { State } from '../../types';

export default (
    state: State,
    injectSource: string,
    res: ServerResponse,
    stream: SendStream
): void => {
    if (state.injectTag) {
        const INJECTED_CODE = getInjectedCode(injectSource);
        const len = INJECTED_CODE.length + Number(res.getHeader('Content-Length'));
        res.setHeader('Content-Length', len);
        const originalPipe = stream.pipe;
        stream.pipe = (resp) => {
            return cast<WritableStream & { pipe: SendStream['pipe'] }>(
                originalPipe.call(
                    stream,
                    es.replace(
                        new RegExp(String(state.injectTag), 'i'),
                        INJECTED_CODE + state.injectTag
                    )
                )
            ).pipe(resp);
        };
    }
};
