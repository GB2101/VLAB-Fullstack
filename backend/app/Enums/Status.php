<?php

namespace App\Enums;

enum Status: string
{
    case Received = 'RECEBIDA';
    case InAnalysis = 'EM_ANALISE';
    case Scheduled = 'AGENDADA';
    case Completed = 'CONCLUIDA';
    case Canceled = 'CANCELADA';


    private function allowedTransitions(): array {
        return match($this) {
            self::Received => [self::InAnalysis, self::Canceled],
            self::InAnalysis => [self::Scheduled, self::Canceled],
            self::Scheduled => [self::Completed, self::Canceled],
            self::Completed => [],
            self::Canceled => [],
        };
    }

    public function validTransition(self $target): bool {
        return in_array($target, $this->allowedTransitions(), true);
    }
}
