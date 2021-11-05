import {newConfigFromEnv} from '../config';
import {newConnections} from '../connections';

import getAPIBalance from '../api/getBalance';
import getChart from '../api/getChart';

import {uploadFile} from '../utils/s3';
import {formatDate} from '../utils/dateUtils';

const config = newConfigFromEnv();
const conns = newConnections(config);

function run(name: string, func: Function) : Promise<string> {
    return func(config, conns).then((resp: any) => {
        const json = JSON.stringify(resp);
        console.log(json);
        return;
        uploadFile(conns.s3, config.aws.bucket, 'analytics/'+name+'.json', json);
        uploadFile(conns.s3, config.aws.bucket, 'analytics/'+name+'-' + formatDate(new Date()) + '.json', json);
    });
}

export default async function handler() {
    return Promise.all([
        run('balance', getAPIBalance),
        run('chart-100-day', getChart),
    ]);
}
