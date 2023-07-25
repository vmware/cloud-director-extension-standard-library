import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Observable, Subscription } from "rxjs";

@Component({
    selector: 'custom-datacenter-container',
    templateUrl: './datacenter.container.component.html'
})
export class DatacenterContainerComponent implements OnDestroy{
    sddcs: any = [
        {name: "Sddc 1", cpu: {used: 11.3, total: 100}, memory: {used: 512, total: 8192}, applications: 23},
        {name: "Sddc 2", cpu: {used: 2.6, total: 100}, memory: {used: 16, total: 8192}, applications: 4},
        {name: "Sddc 3", cpu: {used: 0, total: 100}, memory: {used: 0, total: 8192}, applications: 0}
    ];
    
    constructor() {}

    ngOnDestroy(): void {
        console.warn("[Showcase 2.0]", `${this.constructor.name} destroyed`);
    }

    getCpuUsage(cpu: any): string {
        return `Using ${cpu.used} of ${cpu.total} GHz (${cpu.used / cpu.total * 100}%)`;
    }

    getMemUsage(memory: any): string {
        return `Using ${memory.used} of ${memory.total} GB (${memory.used / memory.total * 100}%)`;
    }
}
