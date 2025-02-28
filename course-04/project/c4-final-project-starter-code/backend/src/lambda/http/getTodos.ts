import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const todos = await getTodosForUser(getUserId(event))
    const items = todos.Items
    return {
      statusCode: 200,
      body: JSON.stringify({items})
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
