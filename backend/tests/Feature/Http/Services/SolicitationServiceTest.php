<?php

use App\Enums\Category;
use App\Enums\Priority;
use App\Enums\Status;
use App\Http\Requests\StoreSolicitationRequest;
use App\Http\Services\SolicitationService;
use App\Models\Solicitation;
use Illuminate\Support\Str;

function makeStoreRequest(array $overrides = []): StoreSolicitationRequest
{
    return StoreSolicitationRequest::create('/', 'POST', array_merge([
        'nome_solicitante' => 'Maria Souza',
        'descricao' => 'Consulta de rotina',
        'categoria' => Category::Appointment->value,
        'prioridade' => Priority::Low->value,
    ], $overrides));
}

describe('create', function () {
    it('creates the solicitation with an initial status of RECEBIDA regardless of any incoming status', function () {
        $service = new SolicitationService;

        $solicitation = $service->create(makeStoreRequest(['status' => Status::Completed->value]));

        expect($solicitation->status)->toBe(Status::Received);
        $this->assertDatabaseHas('solicitations', [
            'id' => $solicitation->id,
            'status' => Status::Received->value,
        ]);
    });

    it('generates a protocol prefixed with the category and the current date', function () {
        Str::createRandomStringsUsing(fn () => 'ABCDEF');
        $this->freezeTime();

        $service = new SolicitationService;

        $solicitation = $service->create(makeStoreRequest(['categoria' => Category::Exam->value]));

        expect($solicitation->protocolo)->toBe('EXA-'.now()->format('ymd').'-ABCDEF');

        Str::createRandomStringsNormally();
    });
});

describe('generateProtocol', function () {
    it('regenerates the protocol when the first candidate already exists', function () {
        $existing = Solicitation::factory()->create([
            'protocolo' => 'EXA-'.date('ymd').'-AAAAAA',
        ]);

        $values = ['AAAAAA', 'BBBBBB'];
        Str::createRandomStringsUsing(function () use (&$values) {
            return array_shift($values);
        });

        $protocol = SolicitationService::generateProtocol(Category::Exam->value);

        expect($protocol)
            ->not->toBe($existing->protocolo)
            ->toBe('EXA-'.date('ymd').'-BBBBBB');

        Str::createRandomStringsNormally();
    });
});

describe('statusTransition', function () {
    it('updates the status and the updated_at timestamp when the transition is allowed', function () {
        $solicitation = Solicitation::factory()->create(['status' => Status::Received]);
        $originalUpdatedAt = $solicitation->updated_at;

        $this->travel(1)->minutes();

        (new SolicitationService)->statusTransition($solicitation, Status::InAnalysis);

        $solicitation->refresh();
        expect($solicitation->status)->toBe(Status::InAnalysis);
        expect($solicitation->updated_at)->not->toEqual($originalUpdatedAt);
    });

    it('throws an exception and does not change the status when the transition is not allowed', function () {
        $solicitation = Solicitation::factory()->create(['status' => Status::Completed]);

        expect(fn () => (new SolicitationService)->statusTransition($solicitation, Status::InAnalysis))
            ->toThrow(InvalidArgumentException::class, 'A transição do Status CONCLUIDA para EM_ANALISE não é permitida.');

        $this->assertDatabaseHas('solicitations', [
            'id' => $solicitation->id,
            'status' => Status::Completed->value,
        ]);
    });
});

describe('summary', function () {
    it('groups the totals by status and by priority', function () {
        Solicitation::factory()->count(2)->create(['status' => Status::Received, 'prioridade' => Priority::Low]);
        Solicitation::factory()->create(['status' => Status::Received, 'prioridade' => Priority::High]);
        Solicitation::factory()->create(['status' => Status::Canceled, 'prioridade' => Priority::Low]);

        $summary = (new SolicitationService)->summary();

        expect($summary['total'])->toBe(4)
            ->and($summary['status'][Status::Received->value])->toBe(3)
            ->and($summary['status'][Status::Canceled->value])->toBe(1)
            ->and($summary['prioridade'][Priority::Low->value])->toBe(3)
            ->and($summary['prioridade'][Priority::High->value])->toBe(1);
    });

    it('zero-fills every status and priority even when no record exists for it', function () {
        Solicitation::factory()->create(['status' => Status::Received, 'prioridade' => Priority::Low]);

        $summary = (new SolicitationService)->summary();

        expect($summary['status']->keys()->all())->toEqual(array_map(fn ($case) => $case->value, Status::cases()))
            ->and($summary['prioridade']->keys()->all())->toEqual(array_map(fn ($case) => $case->value, Priority::cases()))
            ->and($summary['status'][Status::Canceled->value])->toBe(0)
            ->and($summary['prioridade'][Priority::Urgent->value])->toBe(0);
    });
});
