import path from 'path';
import fs from 'fs';
import Logger from '@cl-live-server/logger';
import { INJECT_CANDIDATES, POSSIBLE_EXTENSIONS } from '../../constants';
import type { State } from '../../types';

export default (hasNoOrigin: boolean, state: State, filePath: string): void => {
    const target = path.extname(filePath).toLocaleLowerCase();
    if (hasNoOrigin && POSSIBLE_EXTENSIONS.includes(target)) {
        const contents = fs.readFileSync(filePath, 'utf8');
        for (let i = 0; i < INJECT_CANDIDATES.length; ++i) {
            const match = INJECT_CANDIDATES[i].exec(contents);
            if (match) {
                Logger.debug(`Found inject target: ${match[0]}`);
                state.injectTag = match[0];
                return;
            }
        }
        Logger.warning(`Failed to inject refresh script!
Could not find any of the tags
${INJECT_CANDIDATES}
from '${filePath}'`);
        state.injectTag = null;
    }
};
