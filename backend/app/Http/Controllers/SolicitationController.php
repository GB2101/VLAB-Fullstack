<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Solicitation;
use App\Http\Requests\IndexSolicitationRequest;
use App\Http\Requests\StoreSolicitationRequest;
use App\Http\Requests\UpdateSolicitationRequest;
use App\Http\Resources\SolicitationResource;
use App\Http\Resources\SolicitationCollection;


class SolicitationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexSolicitationRequest $request)
    {
        $pageSize = $request->input('pageSize', 15);
        $category = $request->input('categoria', []);
        $priority = $request->input('prioridade', []);
        $status = $request->input('status', []);

        $query = Solicitation::query()
            ->when($category, fn ($query) => $query->whereIn('categoria', $category))
            ->when($priority, fn ($query) => $query->whereIn('prioridade', $priority))
            ->when($status, fn ($query) => $query->whereIn('status', $status));

        $results = $query->paginate($pageSize);

        return new SolicitationCollection($results->appends($request->query()));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSolicitationRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Solicitation $solicitation)
    {
        return new SolicitationResource($solicitation);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSolicitationRequest $request, Solicitation $solicitation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Solicitation $solicitation)
    {
        //
    }
}
