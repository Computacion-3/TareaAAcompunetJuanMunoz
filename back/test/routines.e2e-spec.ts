import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

interface GraphQLBody<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

describe('Routines GraphQL (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('query routines returns the initial seeded routines', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            routines {
              id
              name
              description
              createdAt
            }
          }
        `,
      })
      .expect(200);

    const body = res.body as GraphQLBody<{
      routines: Array<{ id: number; name: string }>;
    }>;

    expect(body.errors).toBeUndefined();
    expect(body.data?.routines).toHaveLength(3);
    expect(body.data?.routines[0].name).toBe('Torso Fuerza e Hipertrofia');
  });

  it('query routine(id) returns matching routine or null', async () => {
    const foundRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query ($id: Int!) {
            routine(id: $id) {
              id
              name
            }
          }
        `,
        variables: { id: 2 },
      })
      .expect(200);

    const foundBody = foundRes.body as GraphQLBody<{
      routine: { id: number; name: string } | null;
    }>;
    expect(foundBody.data?.routine).toEqual({
      id: 2,
      name: 'Pierna Completa e Isquios',
    });

    const missingRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query ($id: Int!) {
            routine(id: $id) {
              id
            }
          }
        `,
        variables: { id: 999 },
      })
      .expect(200);

    const missingBody = missingRes.body as GraphQLBody<{
      routine: { id: number } | null;
    }>;
    expect(missingBody.data?.routine).toBeNull();
  });

  it('mutation createRoutine creates and persists a routine in memory', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation ($input: CreateRoutineInput!) {
            createRoutine(input: $input) {
              id
              name
              description
              createdAt
            }
          }
        `,
        variables: {
          input: {
            name: 'Movilidad Matinal',
            description: 'Estiramientos dinámicos de 15 minutos.',
          },
        },
      })
      .expect(200);

    const createBody = createRes.body as GraphQLBody<{
      createRoutine: { id: number; name: string; description?: string };
    }>;
    expect(createBody.errors).toBeUndefined();
    expect(createBody.data?.createRoutine.id).toBe(4);
    expect(createBody.data?.createRoutine.name).toBe('Movilidad Matinal');

    const listRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: '{ routines { id name } }',
      })
      .expect(200);

    const listBody = listRes.body as GraphQLBody<{
      routines: Array<{ id: number; name: string }>;
    }>;
    expect(listBody.data?.routines).toHaveLength(4);
  });

  it('mutation createRoutine rejects invalid input via ValidationPipe', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation ($input: CreateRoutineInput!) {
            createRoutine(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            name: 'AB',
          },
        },
      })
      .expect(200);

    const body = res.body as GraphQLBody<unknown>;
    expect(body.errors).toBeDefined();
    expect(body.errors!.length).toBeGreaterThan(0);
  });
});
