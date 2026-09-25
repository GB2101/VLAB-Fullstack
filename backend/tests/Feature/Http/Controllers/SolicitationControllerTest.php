<?php

use App\Enums\Category;
use App\Enums\Priority;
use App\Enums\Status;
use App\Models\Solicitation;

describe('index', function () {
    it('returns a paginated list of solicitations', function () {
        Solicitation::factory()->count(7)->create();

        $response = $this->getJson('/api/v1/solicitacoes?pageSize=5');

        $response->assertOk();
        $response->assertJsonCount(5, 'data');
        $response->assertJsonPath('meta.per_page', 5);
        $response->assertJsonPath('meta.total', 7);
    });

    it('filters by a single status', function () {
        Solicitation::factory()->count(2)->create(['status' => Status::Received]);
        Solicitation::factory()->create(['status' => Status::Canceled]);

        $response = $this->getJson('/api/v1/solicitacoes?status[]=CANCELADA');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.status', Status::Canceled->value);
    });

    it('filters by several values of the same field given as a comma separated string', function () {
        Solicitation::factory()->create(['status' => Status::Received]);
        Solicitation::factory()->create(['status' => Status::Scheduled]);
        Solicitation::factory()->create(['status' => Status::Canceled]);

        $response = $this->getJson('/api/v1/solicitacoes?status=RECEBIDA,CANCELADA');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
        collect($response->json('data'))->pluck('status')
            ->each(fn ($status) => expect($status)->toBeIn([Status::Received->value, Status::Canceled->value]));
    });

    it('combines filters across categoria, prioridade and status', function () {
        $target = Solicitation::factory()->create([
            'categoria' => Category::Exam,
            'prioridade' => Priority::High,
            'status' => Status::InAnalysis,
        ]);
        Solicitation::factory()->create([
            'categoria' => Category::Exam,
            'prioridade' => Priority::Low,
            'status' => Status::InAnalysis,
        ]);

        $response = $this->getJson('/api/v1/solicitacoes?categoria[]=EXAME&prioridade[]=ALTA&status[]=EM_ANALISE');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.id', $target->id);
    });

    it('returns an empty list when no record matches the filters', function () {
        Solicitation::factory()->create(['status' => Status::Received]);

        $response = $this->getJson('/api/v1/solicitacoes?status[]=CONCLUIDA');

        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    });

    it('rejects an invalid filter value with a 422', function () {
        $response = $this->getJson('/api/v1/solicitacoes?status[]=NAO_EXISTE');

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['status.0']);
    });
});

describe('store', function () {
    function validSolicitationPayload(array $overrides = []): array
    {
        return array_merge([
            'nome_solicitante' => 'Maria Souza',
            'descricao' => 'Consulta de rotina',
            'categoria' => Category::Appointment->value,
            'prioridade' => Priority::Low->value,
        ], $overrides);
    }

    it('creates a solicitation with status RECEBIDA and a generated protocol', function () {
        $response = $this->postJson('/api/v1/solicitacoes', validSolicitationPayload());

        $response->assertCreated();
        $response->assertJsonPath('data.status', Status::Received->value);
        $response->assertJsonPath('data.nome_solicitante', 'Maria Souza');
        expect($response->json('data.protocolo'))->toMatch('/^CON-\d{6}-[A-Z0-9]{6}$/');

        $this->assertDatabaseHas('solicitations', [
            'id' => $response->json('data.id'),
            'protocolo' => $response->json('data.protocolo'),
            'status' => Status::Received->value,
        ]);
    });

    it('returns 422 when prioridade is URGENTE without a justificativa_prioridade', function () {
        $response = $this->postJson('/api/v1/solicitacoes', validSolicitationPayload([
            'prioridade' => Priority::Urgent->value,
        ]));

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['justificativa_prioridade']);
        $this->assertDatabaseCount('solicitations', 0);
    });

    it('creates the solicitation when prioridade is URGENTE and a justification is provided', function () {
        $response = $this->postJson('/api/v1/solicitacoes', validSolicitationPayload([
            'prioridade' => Priority::Urgent->value,
            'justificativa_prioridade' => 'Paciente com dor aguda',
        ]));

        $response->assertCreated();
        $response->assertJsonPath('data.justificativa_prioridade', 'Paciente com dor aguda');
    });

    it('does not require justificativa_prioridade for non urgent priorities', function (Priority $priority) {
        $response = $this->postJson('/api/v1/solicitacoes', validSolicitationPayload([
            'prioridade' => $priority->value,
        ]));

        $response->assertCreated();
    })->with([
        'BAIXA' => [Priority::Low],
        'MEDIA' => [Priority::Medium],
        'ALTA' => [Priority::High],
    ]);

    it('returns 422 for an empty payload missing the required fields', function () {
        $response = $this->postJson('/api/v1/solicitacoes', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['nome_solicitante', 'descricao', 'categoria', 'prioridade']);
        $this->assertDatabaseCount('solicitations', 0);
    });

    it('returns 422 for an invalid categoria value', function () {
        $response = $this->postJson('/api/v1/solicitacoes', validSolicitationPayload(['categoria' => 'INVALIDA']));

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['categoria']);
    });

    it('returns 422 for an invalid prioridade value', function () {
        $response = $this->postJson('/api/v1/solicitacoes', validSolicitationPayload(['prioridade' => 'INVALIDA']));

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['prioridade']);
    });
});

describe('show', function () {
    it('returns the details of an existing solicitation', function () {
        $solicitation = Solicitation::factory()->create();

        $response = $this->getJson("/api/v1/solicitacoes/{$solicitation->id}");

        $response->assertOk();
        $response->assertJsonPath('data.id', $solicitation->id);
        $response->assertJsonPath('data.protocolo', $solicitation->protocolo);
    });

    it('returns 404 with a custom message for a numeric id that does not exist', function () {
        $response = $this->getJson('/api/v1/solicitacoes/999999');

        $response->assertNotFound();
        $response->assertJsonPath('message', 'O ID da solicitação não foi encontrado');
    });

    it('returns 404 with the generic fallback message for a non numeric id', function () {
        $response = $this->getJson('/api/v1/solicitacoes/not-a-number');

        $response->assertNotFound();
        $response->assertJsonPath('message', 'Resource not found');
    });
});

describe('transition', function () {
    it('updates the status when the transition is allowed', function () {
        $solicitation = Solicitation::factory()->create(['status' => Status::Received]);

        $response = $this->patchJson("/api/v1/solicitacoes/{$solicitation->id}/status", [
            'status' => Status::InAnalysis->value,
        ]);

        $response->assertNoContent();
        $this->assertDatabaseHas('solicitations', [
            'id' => $solicitation->id,
            'status' => Status::InAnalysis->value,
        ]);
    });

    it('rejects a disallowed transition with a 400 and a clear message', function () {
        $solicitation = Solicitation::factory()->create(['status' => Status::Completed]);

        $response = $this->patchJson("/api/v1/solicitacoes/{$solicitation->id}/status", [
            'status' => Status::InAnalysis->value,
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('message', 'A transição do Status CONCLUIDA para EM_ANALISE não é permitida.');
        $this->assertDatabaseHas('solicitations', [
            'id' => $solicitation->id,
            'status' => Status::Completed->value,
        ]);
    });

    it('rejects an unknown status value with a 422', function () {
        $solicitation = Solicitation::factory()->create(['status' => Status::Received]);

        $response = $this->patchJson("/api/v1/solicitacoes/{$solicitation->id}/status", [
            'status' => 'NAO_EXISTE',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['status']);
    });

    it('returns 404 with a custom message when the solicitation does not exist', function () {
        $response = $this->patchJson('/api/v1/solicitacoes/999999/status', [
            'status' => Status::InAnalysis->value,
        ]);

        $response->assertNotFound();
        $response->assertJsonPath('message', 'O ID da solicitação não foi encontrado');
    });
});

describe('summary', function () {
    it('returns the total and the totals grouped by status and by priority', function () {
        Solicitation::factory()->count(2)->create(['status' => Status::Received, 'prioridade' => Priority::Low]);
        Solicitation::factory()->create(['status' => Status::Canceled, 'prioridade' => Priority::High]);

        $response = $this->getJson('/api/v1/solicitacoes/summary');

        $response->assertOk();
        $response->assertJsonPath('total', 3);
        $response->assertJsonPath('status.'.Status::Received->value, 2);
        $response->assertJsonPath('status.'.Status::Canceled->value, 1);
        $response->assertJsonPath('prioridade.'.Priority::Low->value, 2);
        $response->assertJsonPath('prioridade.'.Priority::High->value, 1);
    });

    it('zero-fills statuses and priorities without any record', function () {
        Solicitation::factory()->create(['status' => Status::Received, 'prioridade' => Priority::Low]);

        $response = $this->getJson('/api/v1/solicitacoes/summary');

        $response->assertOk();
        $response->assertJsonPath('status.'.Status::Canceled->value, 0);
        $response->assertJsonPath('prioridade.'.Priority::Urgent->value, 0);
    });

    it('returns zeroes for every status and priority when there are no solicitations', function () {
        $response = $this->getJson('/api/v1/solicitacoes/summary');

        $response->assertOk();
        $response->assertJsonPath('total', 0);
        $response->assertJsonPath('status.'.Status::Received->value, 0);
        $response->assertJsonPath('prioridade.'.Priority::Low->value, 0);
    });
});
