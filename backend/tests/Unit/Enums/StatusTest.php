<?php

use App\Enums\Status;

it('permits the transition', function (Status $from, Status $to) {
    expect($from->validTransition($to))->toBeTrue();
})->with([
    'RECEBIDA to EM_ANALISE' => [Status::Received, Status::InAnalysis],
    'RECEBIDA to CANCELADA' => [Status::Received, Status::Canceled],
    'EM_ANALISE to AGENDADA' => [Status::InAnalysis, Status::Scheduled],
    'EM_ANALISE to CANCELADA' => [Status::InAnalysis, Status::Canceled],
    'AGENDADA to CONCLUIDA' => [Status::Scheduled, Status::Completed],
    'AGENDADA to CANCELADA' => [Status::Scheduled, Status::Canceled],
]);

it('rejects the transition', function (Status $from, Status $to) {
    expect($from->validTransition($to))->toBeFalse();
})->with(function () {
    $allowed = [
        Status::Received->value.'>'.Status::InAnalysis->value,
        Status::Received->value.'>'.Status::Canceled->value,
        Status::InAnalysis->value.'>'.Status::Scheduled->value,
        Status::InAnalysis->value.'>'.Status::Canceled->value,
        Status::Scheduled->value.'>'.Status::Completed->value,
        Status::Scheduled->value.'>'.Status::Canceled->value,
    ];

    foreach (Status::cases() as $from) {
        foreach (Status::cases() as $to) {
            if (in_array($from->value.'>'.$to->value, $allowed, true)) {
                continue;
            }

            yield "{$from->value} to {$to->value}" => [$from, $to];
        }
    }
});
