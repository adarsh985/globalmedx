const Report = require('../models/Report');
const Alert = require('../models/Alert');
const Hospital = require('../models/Hospital');
const Resource = require('../models/Resource');
const Airport = require('../models/Airport');
const Outbreak = require('../models/Outbreak');
const Incident = require('../models/Incident');
const { logger } = require('../middleware/loggingMiddleware');

// @desc    Trigger specific simulation events
// @route   POST /api/simulate
// @access  Private (Officer/Admin only)
const triggerSimulation = async (req, res) => {
  const { type, country, disease } = req.body;
  
  if (!type) {
    return res.status(400).json({ success: false, message: 'Simulation type is required' });
  }

  try {
    let resultMessage = '';

    switch (type) {
      case 'pandemic_event': {
        // Randomly increase case counts for all existing reports by 15-30%
        const reports = await Report.find();
        const promises = reports.map(async (r) => {
          const increase = Math.floor(Math.random() * 500) + 100;
          const deathIncrease = Math.floor(increase * (Math.random() * 0.05)); // 5% mortality rate max
          const recoveryIncrease = Math.floor(increase * (0.6 + Math.random() * 0.3)); // 60-90% recovery rate
          
          r.cases += increase;
          r.deaths += deathIncrease;
          r.recoveries += recoveryIncrease;
          return r.save();
        });
        await Promise.all(promises);

        // Raise a critical pandemic warning alert
        await Alert.create({
          title: 'GLOBAL CASE SURGE SIMULATION',
          description: 'Surveillance systems detect a concurrent rise in viral pathogen cases worldwide.',
          level: 'Danger',
          status: 'Active'
        });

        // Add to active outbreaks list
        await Outbreak.create({
          disease: 'Influenza B',
          region: 'Global Network',
          severity: 'High',
          status: 'Active',
          caseCount: 4200
        });

        resultMessage = 'Global pandemic case counts successfully incremented. Warning alert issued.';
        logger.warn('Simulation run: Global Pandemic Case Surge', { user: req.user.email });
        break;
      }

      case 'regional_outbreak': {
        const targetCountry = country || 'Brazil';
        const targetDisease = disease || 'Dengue Fever';

        // Check if report exists
        let report = await Report.findOne({ country: targetCountry, disease: targetDisease });
        const surge = Math.floor(Math.random() * 2000) + 1000;
        
        if (report) {
          report.cases += surge;
          report.deaths += Math.floor(surge * 0.02);
          report.recoveries += Math.floor(surge * 0.8);
          await report.save();
        } else {
          report = await Report.create({
            country: targetCountry,
            disease: targetDisease,
            cases: surge,
            deaths: Math.floor(surge * 0.02),
            recoveries: Math.floor(surge * 0.8)
          });
        }

        // Raise an alert
        await Alert.create({
          title: `REGIONAL OUTBREAK: ${targetCountry.toUpperCase()}`,
          description: `Rapid spike of ${surge} cases of ${targetDisease} detected. Deploying field team.`,
          level: 'Warning',
          status: 'Active'
        });

        // Create Incident Log
        await Incident.create({
          title: `Emergency Medical Deployment to ${targetCountry}`,
          description: `Rapid response unit sent to manage localized ${targetDisease} surge.`,
          region: targetCountry,
          status: 'Open',
          reportedBy: 'Outbreak Engine'
        });

        resultMessage = `Regional outbreak simulated successfully for ${targetDisease} in ${targetCountry}.`;
        logger.warn(`Simulation run: Regional Outbreak in ${targetCountry}`, { user: req.user.email });
        break;
      }

      case 'resource_shortage': {
        // Allocate all available items to 100%, and reduce hospital bed availability
        const resources = await Resource.find();
        const resPromises = resources.map(async (r) => {
          r.allocatedQuantity = r.totalQuantity; // Fill capacity
          return r.save();
        });
        await Promise.all(resPromises);

        const hospitals = await Hospital.find();
        const hospPromises = hospitals.map(async (h) => {
          h.availableBeds = Math.floor(h.totalBeds * 0.02); // drop available beds to 2%
          h.activeCases += Math.floor(h.totalBeds * 0.3); // add case load
          return h.save();
        });
        await Promise.all(hospPromises);

        // Raise alarm
        await Alert.create({
          title: 'HEALTHCARE INFRASTRUCTURE STRAIN',
          description: 'Critical hospital bed occupancy rates reached. Stockpiles depleted.',
          level: 'Danger',
          status: 'Active'
        });

        // Add incident
        await Incident.create({
          title: 'Ventilator Reserve Shortage',
          description: 'Emergency supply levels have dropped below critical thresholds across all regions.',
          region: 'Global',
          status: 'Open',
          reportedBy: 'Stockpile Monitoring'
        });

        resultMessage = 'Healthcare resource shortages and hospital capacity load simulated successfully.';
        logger.warn('Simulation run: Critical Healthcare Capacity Strain', { user: req.user.email });
        break;
      }

      case 'traffic_surge': {
        // Double the screening volumes and flag passenger alerts at airports
        const airports = await Airport.find();
        const airportPromises = airports.map(async (a) => {
          const screeningIncrease = Math.floor(Math.random() * 5000) + 2000;
          const flagged = Math.floor(screeningIncrease * 0.01); // 1% flagged
          a.passengersScreened += screeningIncrease;
          a.highRiskFlagged += flagged;
          a.quarantined += Math.floor(flagged * 0.4);
          return a.save();
        });
        await Promise.all(airportPromises);

        await Alert.create({
          title: 'BORDER BAGGAGE SCREENING DELAY',
          description: 'Air travel hubs reporting massive screening volumes. Quarantine protocols engaged.',
          level: 'Info',
          status: 'Active'
        });

        resultMessage = 'Border crossing and travel traffic surge simulated successfully.';
        logger.warn('Simulation run: Border Traffic Surge', { user: req.user.email });
        break;
      }

      case 'region_failure': {
        await Alert.create({
          title: 'CLOUD-REGION OUTAGE: AWS US-EAST-1',
          description: 'Primary datacenter connection lost. Initiating automatic failover DNS route to us-west-2 node.',
          level: 'Danger',
          status: 'Active'
        });

        await Incident.create({
          title: 'AWS Region Outage us-east-1',
          description: 'Primary API server nodes in us-east-1 uncontactable. Route53 re-routing live traffic.',
          region: 'North America',
          status: 'Investigating',
          reportedBy: 'DevOps Health Probe'
        });

        resultMessage = 'Cloud Region AWS us-east-1 outage simulated successfully. Active failover triggers logged.';
        logger.error('Simulation run: Cloud Region Outage', { region: 'us-east-1', user: req.user.email });
        break;
      }

      case 'cyberattack': {
        await Alert.create({
          title: 'CYBER-ATTACK DETECTED: DDoS BLOCKADE',
          description: 'Web Application Firewall (WAF) actively dropping high-volume traffic spike from malicious proxy pools.',
          level: 'Danger',
          status: 'Active'
        });

        await Incident.create({
          title: 'DDoS Traffic Spike Mitigated',
          description: 'Intrusion prevention logs record 45k req/s traffic burst. Target API: /api/reports.',
          region: 'Global Network',
          status: 'Open',
          reportedBy: 'Cloudflare WAF API'
        });

        resultMessage = 'DDoS cyberattack attempt simulated. Mitigation log blocks verified.';
        logger.warn('Simulation run: Security Breach Mitigated', { type: 'DDoS', user: req.user.email });
        break;
      }

      case 'data_corruption': {
        await Alert.create({
          title: 'DATA INTEGRITY CHECK FAIL',
          description: 'Database index signature mismatch. Automatic database restore routine initialized.',
          level: 'Warning',
          status: 'Active'
        });

        await Incident.create({
          title: 'Database Checksum Inconsistency',
          description: 'Epidemiological collections index checksum mismatch. System restored state using backups.',
          region: 'Data Cluster',
          status: 'Resolved',
          reportedBy: 'Cron Integrity Check'
        });

        resultMessage = 'Database index data corruption simulated. Automated restore script logged.';
        logger.error('Simulation run: Data Corruption Recovery', { user: req.user.email });
        break;
      }

      case 'analytics_workload': {
        await Alert.create({
          title: 'ANALYTICS ENGINE OVERLOAD',
          description: 'Large-scale modeling simulations executing forecasting algorithm runs. CPU spikes detected.',
          level: 'Warning',
          status: 'Active'
        });

        const start = Date.now();
        while (Date.now() - start < 1000) {
          Math.sqrt(Math.random() * Math.random());
        }

        resultMessage = 'Heavy analytical workload successfully triggered. Real Node.js process CPU load spike induced.';
        logger.warn('Simulation run: Analytics Workload Induced', { user: req.user.email });
        break;
      }

      default:
        return res.status(400).json({ success: false, message: 'Invalid simulation type specified' });
    }

    res.json({ success: true, message: resultMessage });
  } catch (error) {
    logger.error('Error executing simulation', { error: error.message });
    res.status(500).json({ success: false, message: 'Simulation engine error' });
  }
};

module.exports = { triggerSimulation };
