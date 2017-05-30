ds = deepstream('ws://localhost:6020');
koTools = new KoTools(ko);

var record = ds.record.getRecord('some-name')

ds.login({ username: 'simulator-instance-' + ds.getUid() }, function () {
	ko.applyBindings(new AppViewModel());
});

record.subscribe('firstname', function (value) {
	$("#state").val(value);
})

$('#state').bind('input propertychange', function () {
	record.set('firstname', $('#state').val())
	ds.event.emit('device/connect', 'I am connected')
});

function setupChart() {
	$("#morris-area-chart").empty();

	Morris.Area({
		element: 'morris-area-chart',
		data: [{
			timeStamp: '2012-02-24 15:00:00',
			noNodes: 6,
			noSimulators: 12000,
			noMessages: 23465978
		}, {
			timeStamp: '2012-02-24 15:00:10',
			noNodes: 6,
			noSimulators: 12003,
			noMessages: 23665978
		},
		{
			timeStamp: '2012-02-24 15:00:20',
			noNodes: 7,
			noSimulators: 15503,
			noMessages: 25665978
		}],
		xkey: 'timeStamp',
		ykeys: ['noNodes', 'noSimulators', 'noMessages'],
		labels: ['noNodes', 'noSimulators', 'noMessages'],
		pointSize: 2,
		hideHover: 'auto',
		resize: true
	});
}

/**
 * Class AppViewModel
 */
AppViewModel = function () {
	this.users = koTools.getViewList(UserListEntryViewModel, ds.record.getList('users'));
	this.simulations = koTools.getViewList(SimulationListEntryViewModel, ds.record.getList('simulations'));
	this.simulators = koTools.getViewList(SimulatorListEntryViewModel, ds.record.getList('simulators'));

	this.user = new UserViewModel();
	this.simulation = new SimulationViewModel();
	this.simulator = new SimulatorViewModel();
	this.node = new NodeViewModel();
};

AppViewModel.prototype.addSimulation = function () {
	var newSimulationId = 'Simulation-' + ds.getUid();
	var record = ds.record.getRecord(newSimulationId);
	record.set({ simulationId: newSimulationId, noNodes: 10, noSimulators: 100000, frequency: 5 });
	this.simulations.getList().addEntry(newSimulationId);
};

AppViewModel.prototype.startSimulator = function () {

	const list = ds.record.getList('simulators');

	var entries = list.getEntries();

	if (entries.length > 0) {
		ds.rpc.make(list.getEntries()[entries.length - 1], { frequency: 4, payloadSize: 10 }, (error, result) => {
			// error = null, result = 11
		});


	}
};

AppViewModel.prototype.addUser = function () {
	var name = 'users/' + ds.getUid(),
		record = ds.record.getRecord(name);

	record.set({ firstname: 'Admin', lastname: 'Admin', role: '-' });
	this.users.getList().addEntry(name);
};

AppViewModel.prototype.selectUser = function (userAppViewModel) {
	this.user.record.setName(userAppViewModel.record.name);
	this.users.callOnEntries('isActive', [false]);
	userAppViewModel.isActive(true);

};

AppViewModel.prototype.selectSimulation = function (simulationAppViewModel) {
	this.simulation.record.setName(simulationAppViewModel.record.name);
	this.users.callOnEntries('isActive', [false]);
	simulationAppViewModel.isActive(true);

	setupChart();
};

AppViewModel.prototype.selectSimulator = function (simulatorAppViewModel) {
	this.simulator.record.setName(simulatorAppViewModel.record.name);
	this.users.callOnEntries('isActive', [false]);
	simulatorAppViewModel.isActive(true);

};

/**
 * Class UserListEntryViewModel
 */
UserListEntryViewModel = function (userRecordName, viewList) {
	this.record = ds.record.getRecord(userRecordName);
	this.viewList = viewList;
	this.firstname = koTools.getObservable(this.record, 'firstname');
	this.lastname = koTools.getObservable(this.record, 'lastname');
	this.role = koTools.getObservable(this.record, 'role');
	this.isActive = ko.observable(false);
};

SimulationListEntryViewModel = function (simulationRecordId, viewList) {
	this.record = ds.record.getRecord(simulationRecordId);
	this.viewList = viewList;
	this.simulationId = koTools.getObservable(this.record, 'simulationId');
	this.startTimeStamp = koTools.getObservable(this.record, 'startTimeStamp');
	this.endTimeStamp = koTools.getObservable(this.record, 'endTimeStamp');
	this.payloadSize = koTools.getObservable(this.record, 'payloadSize');
	this.payload = koTools.getObservable(this.record, 'payload');
	this.noNodes = koTools.getObservable(this.record, 'noNodes');
	this.noSimulators = koTools.getObservable(this.record, 'noSimulators');
	this.frequency = koTools.getObservable(this.record, 'frequency');
	this.isActive = ko.observable(false);
};

SimulatorListEntryViewModel = function (simulatorRecordId, viewList) {
	this.record = ds.record.getRecord(simulatorRecordId);
	this.viewList = viewList;
	this.simulatorId = koTools.getObservable(this.record, 'simulatorId');
	this.runtime = koTools.getObservable(this.record, 'runtime');
	this.status = koTools.getObservable(this.record, 'status');
	this.frequency = koTools.getObservable(this.record, 'frequency');
	this.payload = koTools.getObservable(this.record, 'payload');
	this.connectionString = koTools.getObservable(this.record, 'connectionString');

	this.isActive = ko.observable(false);
};

UserListEntryViewModel.prototype.deleteUser = function (viewModel, event) {
	event.stopPropagation();
	this.viewList.getList().removeEntry(this.record.name);
	this.record.delete();
};

SimulationListEntryViewModel.prototype.deleteSimulation = function (viewModel, event) {
	event.stopPropagation();
	this.viewList.getList().removeEntry(this.record.name);
	this.record.delete();
};

SimulatorListEntryViewModel.prototype.deleteSimulator = function (viewModel, event) {
	event.stopPropagation();
	this.viewList.getList().removeEntry(this.record.name);
	this.record.delete();
};

/**
 * Class UserViewModel
 */
SimulationViewModel = function () {
	this.record = ds.record.getAnonymousRecord();
	this.simulationId = koTools.getObservable(this.record, 'simulationId');
	this.startTimeStamp = koTools.getObservable(this.record, 'startTimeStamp');
	this.endTimeStamp = koTools.getObservable(this.record, 'endTimeStamp');
	this.noNodes = koTools.getObservable(this.record, 'noNodes');
	this.noSimulators = koTools.getObservable(this.record, 'noSimulators');
	this.noMessages = koTools.getObservable(this.record, 'noMessages');
	this.payLoadSize = koTools.getObservable(this.record, 'payLoadSize');
	this.payLoad = koTools.getObservable(this.record, 'payLoad');
	this.frequency = koTools.getObservable(this.record, 'frequency');
};

SimulatorViewModel = function () {
	this.record = ds.record.getAnonymousRecord();
	this.simulatorId = koTools.getObservable(this.record, 'simulatorId');
	this.type = koTools.getObservable(this.record, 'type');
	this.status = koTools.getObservable(this.record, 'status');
	this.frequency = koTools.getObservable(this.record, 'frequency');
	this.connectionString = koTools.getObservable(this.record, 'connectionString');
	this.payload = koTools.getObservable(this.record, 'payload');

};

UserViewModel = function () {
	this.record = ds.record.getAnonymousRecord();
	this.firstname = koTools.getObservable(this.record, 'firstname');
	this.lastname = koTools.getObservable(this.record, 'lastname');
	this.role = koTools.getObservable(this.record, 'role');
};

NodeViewModel = function () {
	this.record = ds.record.getAnonymousRecord();
	this.id = koTools.getObservable(this.record, 'id');
	this.memUsed = koTools.getObservable(this.record, 'memUsed');
	this.memLeft = koTools.getObservable(this.record, 'memLeft');
	this.noSimulators = koTools.getObservable(this.record, 'noSimulators');
};