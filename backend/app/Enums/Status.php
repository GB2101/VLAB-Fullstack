<?php

namespace App\Enums;

enum Status: string
{
    case Received = 'RECEBIDA';
    case InAnalysis = 'EM_ANALISE';
    case Scheduled = 'AGENDADA';
    case Completed = 'CONCLUIDA';
    case Canceled = 'CANCELADA';
}
