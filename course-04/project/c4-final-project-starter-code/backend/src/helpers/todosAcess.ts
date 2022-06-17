import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

//Implement the dataLayer logic

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly createdAtIndex = process.env.TODOS_CREATED_AT_INDEX
    ){}

    /** Create todods */
    async createTodosAccess(newTodo: TodoItem): Promise<TodoItem> {
        logger.info('[Repo] Creating new TodoItem for userId ', newTodo.userId, ' name ', newTodo.name)
        await this.docClient.put({
            TableName: this.todosTable,
            Item: newTodo
        }).promise()
        logger.info('[Repo] Created new TodoItem for userId ', newTodo.userId, ' name ', newTodo.name)
        return newTodo
    }

    /** Get todos for userid */
    async getTodosForUser(userId: string): Promise<any> {
        logger.info('[Repo] Start getting todos for userId ', userId)
        const todos = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.createdAtIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        logger.info('[Repo] End getting todos for userId ', userId)
        return todos
    }

    /** Update todo by userId & todoId */
    async updateTodo(userId: string, todoId: string, updatedTodo: TodoUpdate): Promise<TodoUpdate> {
        logger.info('[Repo] Updating todo for userId ', userId, ' todoId ', todoId)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: 'set #name=:name, #dueDate=:dueDate, #done=:done',
            ExpressionAttributeNames: { '#name': 'name', '#dueDate': 'dueDate', '#done': 'done' },
            ExpressionAttributeValues: {
                ':name': updatedTodo.name,
                ':dueDate': updatedTodo.dueDate,
                ':done': updatedTodo.done
            }
        }).promise()
        logger.info('[Repo] Updated todos for userId ', userId, ' todoId ', todoId)
        return updatedTodo
    }

    /** Delete todo by userId & todoId */
    async deleteTodo(userId: string, todoId: string) {
        logger.info('[Repo] Delete todos by userId ', userId, ' todoId ', todoId)
        return await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            }
        }).promise()
    }

    /** Create attachment signed Url */
    async createAttachmentPresignedUrl(userId: string, todoId: string, signedUrl: string): Promise<any> {
        logger.info('[Repo] Create signed Url for userId ', userId, ' todoId ', todoId)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set attachmentUrl=:url",
            ExpressionAttributeValues: {
                ":url": signedUrl.split("?")[0]
            }
        }).promise()
        return signedUrl
    }
}
