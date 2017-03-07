ds = deepstream('ws://vjiotprofiler.westeurope.cloudapp.azure.com:6020');
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

/**
 * Class AppViewModel
 */
AppViewModel = function () {
	this.users = koTools.getViewList(UserListEntryViewModel, ds.record.getList('users'));
	this.simulations = koTools.getViewList(SimulationListEntryViewModel, ds.record.getList('simulations'));
	this.user = new UserViewModel();
	this.simulation = new SimulationViewModel();
};

AppViewModel.prototype.addSimulation = function () {
	var newSimulationId = 'Simulation-' + ds.getUid();
	var record = ds.record.getRecord(newSimulationId);
	record.set({simulationId: newSimulationId,noNodes:0,noDevices:0});
	this.simulations.getList().addEntry(newSimulationId);
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

SimulationListEntryViewModel = function (simulationRecordId,viewList) {
	this.record = ds.record.getRecord(simulationRecordId);
	this.viewList = viewList;
	this.simulationId = koTools.getObservable(this.record, 'simulationId');
	this.startTimeStamp = koTools.getObservable(this.record, 'startTimeStamp');
	this.endTimeStamp = koTools.getObservable(this.record, 'endTimeStamp');
	this.payloadSize = koTools.getObservable(this.record, 'payloadSize');
	this.payload = koTools.getObservable(this.record, 'payload');
	this.noNodes = koTools.getObservable(this.record, 'noNodes');
	this.noDevices = koTools.getObservable(this.record, 'noDevices');
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

/**
 * Class UserViewModel
 */
SimulationViewModel = function () {
	this.record = ds.record.getAnonymousRecord();
	this.simulationId = koTools.getObservable(this.record, 'simulationId'); 
	this.startTimeStamp = koTools.getObservable(this.record, 'startTimeStamp');
	this.endTimeStamp = koTools.getObservable(this.record, 'endTimeStamp');
	this.noNodes = koTools.getObservable(this.record, 'noNodes');
	this.noDevices = koTools.getObservable(this.record, 'noDevices');
	this.noMessages = koTools.getObservable(this.record, 'noMessages');
	this.payLoadSize = koTools.getObservable(this.record, 'payLoadSize');
	this.payLoad = koTools.getObservable(this.record, 'payLoad');
};

UserViewModel = function () {
	this.record = ds.record.getAnonymousRecord();
	this.firstname = koTools.getObservable(this.record, 'firstname');
	this.lastname = koTools.getObservable(this.record, 'lastname');
	this.role = koTools.getObservable(this.record, 'role');
};