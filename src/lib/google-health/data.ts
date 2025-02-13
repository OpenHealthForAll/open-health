import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function fetchGoogleHealthData(authToken: string) {
  oauth2Client.setCredentials({ access_token: authToken });

  const fitness = google.fitness({ version: 'v1', auth: oauth2Client });

  const dataSources = await fitness.users.dataSources.list({
    userId: 'me',
  });

  const healthData = [];

  for (const dataSource of dataSources.data.dataSource || []) {
    const dataSet = await fitness.users.dataSources.datasets.get({
      userId: 'me',
      dataSourceId: dataSource.dataStreamId,
      datasetId: '0-9999999999999',
    });

    healthData.push({
      dataSource: dataSource.dataStreamName,
      data: dataSet.data.point,
    });
  }

  return healthData;
}

function parseGoogleHealthData(rawData: any) {
  return rawData.map((data: any) => {
    return {
      source: data.dataSource,
      values: data.data.map((point: any) => ({
        startTime: point.startTimeNanos,
        endTime: point.endTimeNanos,
        value: point.value,
      })),
    };
  });
}

export async function getGoogleHealthData(authToken: string) {
  const rawData = await fetchGoogleHealthData(authToken);
  return parseGoogleHealthData(rawData);
}

export async function saveHealthData(data: any) {
  // Implement the logic to save health data to the database
  // This is a placeholder function and should be replaced with actual implementation
  return data;
}
